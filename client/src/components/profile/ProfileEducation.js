import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment';

const ProfileEducation = ({
  education: { schoole, degree, fieldofstudy, current, description, from, to }
}) => <div>
  <h3 className='text-dark'>{schoole}</h3>
  <p>
    <Moment format='DD/MM/YYYY'>{from}</Moment> -{' '} {!to ? ' Now' : <Moment format='DD/MM/YYYY'>{to}</Moment>}
  </p>
  <p>
    <strong>Degree:</strong> {degree}
  </p>
  <p>
    <strong>Field Of Study:</strong> {fieldofstudy}
  </p>
  {(description && 
      <p>
      <strong>Description:</strong> {description}
    </p>
       )}
  
</div>

ProfileEducation.propTypes = {
  education: PropTypes.object.isRequired
}

export default ProfileEducation