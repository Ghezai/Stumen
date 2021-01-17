import React, {
  Fragment,
  useEffect
} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import AddExperence from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import Posts from './components/posts/Posts';
import TermsAndPrivacy from './components/auth/TermsAndPrivacy';
import Post from './components/post/Post';
import Habesha from './components/habesha/Habesha';


// Redux
import {
  Provider
} from 'react-redux';
import store from './store';
import {
  loadUser
} from './actions/auth';

import './App.css';
import setAuthToken from './utils/setAuthToken';


if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []); // we use [] as second parameter because we want to run this one time.
  //
  return ( <Provider store = { store } >
            <Router>
              <Fragment >
               <Navbar />
               <Route exact path = '/' component = {Landing}/> 
               <section className = 'container' >
                <Alert />
               < Switch >
                  <Route exact path = '/register' component = {Register}/> 
                  <Route exact path = '/login' component = {Login}/> 
                  <PrivateRoute exact path = '/dashboard' component = {Dashboard}/> 
                  <PrivateRoute exact path = '/create-profile' component = {CreateProfile}/> 
                  <PrivateRoute exact path = '/edit-profile' component = {EditProfile}/> 
                  <PrivateRoute exact path = '/add-experience' component = {AddExperence}/>
                  <PrivateRoute exact path = '/add-education' component = {AddEducation}/>  
                  <Route exact path = '/profiles' component = {Profiles}/> 
                  <Route exact path = '/profile/:id' component = {Profile}/> 
                  <PrivateRoute exact path = '/posts' component = {Posts}/> 
                  <Route exact path = '/termsandprivacy' component = {TermsAndPrivacy}/> 
                  <PrivateRoute exact path = '/posts/:id' component = {Post}/>
                  <Route exact path = '/habesha' component = {Habesha}/> 
               </Switch > 
               </section> 
              </Fragment> 
            </Router> 
          </Provider >
  )
};

export default App;