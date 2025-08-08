## Microfrontend Architecture Manual: Angular Host & React Remote

This project utilizes **Webpack Module Federation** to enable a seamless integration between an Angular host application and a React microfrontend. This architecture allows independent development and deployment of different parts of your application while maintaining a unified user experience.

### 1. Architecture Overview

*   **Angular Host (`frontend/`):** This is your main application. It's responsible for the overall layout, navigation, and orchestrating the loading of microfrontends. It consumes components exposed by remote microfrontends.
*   **React Remote (`mfe-react/`):** This is an independent microfrontend. It exposes its components (e.g., the Login component) to be consumed by the Angular host.

**Module Federation** allows these separate applications to dynamically load code from each other at runtime, treating them as a single application.

### 2. Project Structure

Your project has the following relevant structure:

```
/Users/carlossinhuegarciahernandez/Documents/Booleana/
├───frontend/             <-- Angular Host Application
│   ├───src/
│   │   ├───app/
│   │   │   ├───components/
│   │   │   │   └───react-mfe-wrapper/  <-- Angular component to load React MFEs
│   │   │   │       └───react-mfe-wrapper.component.ts
│   │   └───...
│   ├───angular.json      <-- Angular CLI configuration
│   ├───package.json      <-- Angular dependencies and scripts
│   ├───webpack.config.js <-- Webpack configuration for Angular (used by ngx-build-plus)
│   └───...
├───mfe-react/            <-- React Microfrontend (Remote)
│   ├───src/
│   │   ├───App.tsx       <-- Default React App component
│   │   ├───Login.tsx     <-- Your new Login component
│   │   └───index.tsx     <-- Entry point for React MFE
│   ├───package.json      <-- React dependencies and scripts
│   ├───config/
│   │   └───webpack.config.js <-- Webpack configuration for React (crucial for Module Federation)
│   └───...
└───scripts/              <-- Utility scripts (e.g., dev.sh, prod.sh)
```

### 3. Development Workflow

To run both applications concurrently during development:

1.  **Start the React Microfrontend:**
    ```bash
    cd /Users/carlossinhuegarciahernandez/Documents/Booleana/mfe-react
    npm start
    ```
    This will typically run on `http://localhost:4201`.

2.  **Start the Angular Host Application:**
    ```bash
    cd /Users/carlossinhuegarciahernandez/Documents/Booleana/frontend
    npm start
    ```
    This will typically run on `http://localhost:4200`.

Ensure both are running for the Module Federation to work correctly.

### 4. Creating and Exposing Components (React Remote)

To make a React component available to the Angular host:

1.  **Create your React Component:**
    Create your React component as usual (e.g., `src/MyNewReactComponent.tsx`).

    ```typescript
    // mfe-react/src/MyNewReactComponent.tsx
    import React from 'react';

    interface MyNewReactComponentProps {
      message: string;
      onButtonClick: () => void;
    }

    const MyNewReactComponent: React.FC<MyNewReactComponentProps> = ({ message, onButtonClick }) => {
      return (
        <div style={{ border: '2px dashed green', padding: '10px', margin: '10px' }}>
          <h3>Hello from MyNewReactComponent!</h3>
          <p>{message}</p>
          <button onClick={onButtonClick}>Click Me (React)</button>
        </div>
      );
    };

    export default MyNewReactComponent;

    // This `mount` function is crucial for Angular to render the component
    export function mount(element: HTMLElement, props?: MyNewReactComponentProps) {
      const root = (window as any).ReactDOM.createRoot(element);
      root.render(<MyNewReactComponent {...props} />);
    }
    ```
    **Important:** For Angular to render your React component, you need to export a `mount` function (or similar) that takes an HTML element and renders your React component into it. This is how the Angular wrapper component will interact with your React MFE.

2.  **Expose the Component in `webpack.config.js`:**
    Open `mfe-react/config/webpack.config.js`. Locate the `ModuleFederationPlugin` configuration. Add your new component to the `exposes` object.

    ```javascript
    // mfe-react/config/webpack.config.js
    // ...
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: 'mfeReact',
        filename: 'remoteEntry.js',
        exposes: {
          './Interview': './src/App', // Existing
          './Login': './src/Login',   // Existing
          './MyNewReactComponent': './src/MyNewReactComponent', // Add this line
        },
        shared: {
          // ... shared dependencies
        },
      }),
      // ... other plugins
    ],
    // ...
    ```
    The key `'./MyNewReactComponent'` is the alias you'll use in Angular, and the value `'./src/MyNewReactComponent'` is the path to your component file within the React project.

### 5. Consuming Components (Angular Host)

To consume a React component exposed by the `mfe-react` remote:

1.  **Use `loadRemoteModule` in an Angular Component:**
    You'll typically have a wrapper component in Angular (like `react-mfe-wrapper.component.ts`) that handles loading and rendering the remote React component.

    ```typescript
    // frontend/src/app/components/react-mfe-wrapper/react-mfe-wrapper.component.ts
    import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
    import { loadRemoteModule } from '@angular-architects/module-federation';

    @Component({
      selector: 'app-react-mfe-wrapper',
      standalone: true,
      template: '<div #reactMfeContainer></div>',
      styleUrls: ['./react-mfe-wrapper.component.scss']
    })
    export class ReactMfeWrapperComponent implements OnInit {
      @ViewChild('reactMfeContainer', { static: true }) reactMfeContainer!: ElementRef;
      @Input() componentName: string = 'Login'; // Default to Login, or pass dynamically
      @Input() componentProps: any = {}; // Input to pass props to the React component

      constructor() { }

      async ngOnInit(): Promise<void> {
        try {
          const { mount } = await loadRemoteModule({
            type: 'module',
            remoteEntry: 'http://localhost:4201/remoteEntry.js',
            exposedModule: `./${this.componentName}` // Dynamically load based on input
          });

          if (mount) {
            // Pass the element and any props to the React mount function
            mount(this.reactMfeContainer.nativeElement, this.componentProps);
          } else {
            console.error(`Mount function not found for remote module: ${this.componentName}.`);
          }
        } catch (error) {
          console.error(`Error loading React MFE component ${this.componentName}:`, error);
        }
      }
    }
    ```
    **Explanation:**
    *   `@ViewChild('reactMfeContainer')`: Gets a reference to the `div` element where the React component will be rendered.
    *   `loadRemoteModule`: This function (from `@angular-architects/module-federation`) is key.
        *   `remoteEntry`: Points to the `remoteEntry.js` file of your React microfrontend.
        *   `exposedModule`: Specifies which exposed module (component) from the React MFE you want to load.
    *   `mount(this.reactMfeContainer.nativeElement, this.componentProps)`: Calls the `mount` function exported by the React component, passing the DOM element and any data (`componentProps`) you want to send to the React component.

2.  **Use the Wrapper Component in Angular Templates:**
    Now you can use your `app-react-mfe-wrapper` component in any Angular template, passing the `componentName` and `componentProps` as needed.

    ```html
    <!-- frontend/src/app/app.component.html (example) -->
    <h1>My Angular Host Application</h1>

    <app-react-mfe-wrapper
      [componentName]="'Login'"
      [componentProps]="{ /* any props for Login */ }"
    ></app-react-mfe-wrapper>

    <app-react-mfe-wrapper
      [componentName]="'MyNewReactComponent'"
      [componentProps]="{ message: 'Data from Angular!', onButtonClick: handleReactButtonClick }"
    ></app-react-mfe-wrapper>
    ```
    You would define `handleReactButtonClick` in your Angular component's TypeScript file.

### 6. Sharing Data

#### 6.1. Angular Host to React Remote (Props/Inputs)

As shown in the `ReactMfeWrapperComponent` example above, you can pass data from Angular to React using the `componentProps` input. The `mount` function in your React component should be designed to accept these props.

**Angular (Host):**
```typescript
// frontend/src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-react-mfe-wrapper
      [componentName]="'MyNewReactComponent'"
      [componentProps]="{ message: 'Hello from Angular!', userId: 123 }"
    ></app-react-mfe-wrapper>
  `,
  // ...
})
export class AppComponent { }
```

**React (Remote):**
```typescript
// mfe-react/src/MyNewReactComponent.tsx
import React from 'react';

interface MyNewReactComponentProps {
  message: string;
  userId: number;
}

const MyNewReactComponent: React.FC<MyNewReactComponentProps> = ({ message, userId }) => {
  return (
    <div>
      <p>Message from Angular: {message}</p>
      <p>User ID from Angular: {userId}</p>
    </div>
  );
};

export default MyNewReactComponent;

export function mount(element: HTMLElement, props?: MyNewReactComponentProps) {
  const root = (window as any).ReactDOM.createRoot(element);
  root.render(<MyNewReactComponent {...props} />);
}
```

#### 6.2. React Remote to Angular Host (Events/Outputs)

For React to send data back to Angular, you can pass a callback function as a prop from Angular to React.

**Angular (Host):**
```typescript
// frontend/src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-react-mfe-wrapper
      [componentName]="'Login'"
      [componentProps]="{ onLoginSuccess: handleLoginSuccess }"
    ></app-react-mfe-wrapper>
  `,
  // ...
})
export class AppComponent {
  handleLoginSuccess(userData: any) {
    console.log('Login successful in Angular!', userData);
    // Perform actions in Angular, e.g., navigate, store user data
  }
}
```

**React (Remote):n```typescript
// mfe-react/src/Login.tsx
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (userData: { username: string; token: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Simulate authentication
    const userData = { username, token: 'fake-jwt-token' };
    if (onLoginSuccess) {
      onLoginSuccess(userData); // Call the Angular callback
    }
  };

  return (
    // ... login form UI
  );
};

export default Login;

export function mount(element: HTMLElement, props?: LoginProps) {
  const root = (window as any).ReactDOM.createRoot(element);
  root.render(<Login {...props} />);
}
```

#### 6.3. Shared State / Global Communication

For more complex scenarios, consider:

*   **Custom Event Bus:** Implement a simple event emitter (e.g., using RxJS `Subject` in Angular and a custom event dispatcher in React) that both frameworks can subscribe to.
*   **Browser Storage:** Use `localStorage` or `sessionStorage` for simple, persistent data sharing. Be mindful of security and data types.
*   **Shared Library:** If you have common utilities or data models, create a shared library that contains an API client.

### 7. Routing

Routing in a microfrontend setup can be handled in a few ways:

*   **Host-Driven Routing (Recommended for simplicity):** The Angular host application manages the primary routing. When a route corresponds to a microfrontend, the Angular router renders a component (like `react-mfe-wrapper`) that then loads the appropriate microfrontend component.
    *   Example: `/login` route in Angular renders `app-react-mfe-wrapper` with `componentName="Login"`.
*   **Microfrontend-Internal Routing:** A microfrontend can have its own internal router (e.g., React Router within React). This is useful if the microfrontend has complex internal navigation.
*   **Coordinated Routing:** For seamless navigation across microfrontends, you might need to synchronize their routers. This can be complex and often involves listening to URL changes and programmatically navigating in other microfrontends. Start with host-driven routing and add complexity only if necessary.

### 8. Connections (API Calls)

Each microfrontend can make its own API calls independently.

*   **Independent API Services:** Both Angular and React can have their own services for interacting with backend APIs.
*   **Shared API Client (Optional):** If you have a common backend and want to ensure consistent API interaction, you could create a shared library that contains an API client. This library would then be consumed by both Angular and React.
*   **Authentication:** Ensure your authentication mechanism (e.g., JWT tokens) is accessible to both microfrontends, typically stored in `localStorage` or `sessionStorage` after a successful login. Each microfrontend would then include this token in its API requests.

### 9. Best Practices and Considerations

*   **Shared Dependencies:** Module Federation allows sharing dependencies (like React, ReactDOM, Angular, RxJS) to reduce bundle size. Ensure `shared` configurations in `webpack.config.js` are correctly set up with `singleton: true` and `requiredVersion` to avoid multiple instances of the same library.
*   **Styling:** Be mindful of CSS conflicts. Use scoped CSS (e.g., CSS Modules in React, component-scoped styles in Angular) or a consistent CSS methodology (e.g., BEM, Tailwind CSS) across microfrontends.
*   **Error Handling:** Implement robust error handling for loading remote modules. What happens if a microfrontend fails to load?
*   **Performance:** Lazy load microfrontends where possible to improve initial load times.
*   **Communication Patterns:** Choose the simplest communication pattern that meets your needs. Start with props/inputs/outputs and only move to more complex shared state solutions if truly required.
*   **Version Management:** Carefully manage versions of shared libraries to prevent compatibility issues.

---
