import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import successImage from '../../img/landingPageSuccessImage.svg';

const Habesha = ({ isAuthenticated }) => {
    
    if(isAuthenticated) {
        return <Redirect to='/dashboard' />;
    }

    return (
        <section className='landing'>
            <div className='dark-overlay'>
                <div className='landing-inner'>
                    <h1 className='x-large'>Welcome To Habesha Bussines</h1>
                    <p className='lead'>
                        Create a free Habesha bussines profile and become more visible in Habesha community around the World.
                    </p>
                    <div className='buttons'>
                        <Link to='/register' className='btn btn-primary'>
                            <strong>SIGN UP</strong>
                        </Link>
                        <Link to='/login' className='btn btn-primary'>
                            <strong>LOG IN</strong>
                        </Link>
                    </div>     
                </div>
                <div>
                <img src={successImage} />
            </div>
        <div>
      </div>
  </div>       
</section>    
);
};

Habesha.propTypes = {
    isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({ 
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Habesha);