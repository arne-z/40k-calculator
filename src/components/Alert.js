import React from 'react';
import './Alert.scss';


function Alert(props) {
    const { message } = props;
    return (
        <div className="Alert">
            {message}
         </div>
    );
}

export default Alert;