import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import successImage from '../../img/landingPageSuccessImage.svg';

const Landing = ({ isAuthenticated }) => {
    if(isAuthenticated) {
        return <Redirect to='/dashboard' />;
    }
    return (
        <section className='landing'>
            <div className='dark-overlay'>
                <div className='landing-inner'>
                    <h1 className='x-large'>Mentoring Made Easy</h1>
                    <p className='lead'>
                        Create a free STUMEN account and get connect with important people around you, upgrade your skills, and level up in life.  
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

Landing.propTypes = {
    isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({ 
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Landing);