import { Routes } from '@angular/router';
import { ReactMfeWrapperComponent } from './components/react-mfe-wrapper/react-mfe-wrapper.component';
import { InterviewComponent } from './components/interview/interview.component';

export const routes: Routes = [
    { path: 'react-mfe', component: ReactMfeWrapperComponent },
    { path: 'interview', component: InterviewComponent },
    { path: '', redirectTo: '/react-mfe', pathMatch: 'full' }
];
