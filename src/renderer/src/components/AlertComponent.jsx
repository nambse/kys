/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';


const AlertComponent = ({
    message,
    isVisible,
    autoHideDuration = 3000,
    backgroundColor = 'bg-blue-500',
    textColor = 'text-white',
    padding = 'p-4', // Default padding
    position,
    onHide
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                if (onHide) {
                    onHide();
                }
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoHideDuration, onHide]);

    const slideInClass = position === 'top' ? 'top-0' : 'bottom-0';
    const slideOutClass = position === 'top' ? '-top-full' : '-bottom-full';
    const alertPositionClass = show ? slideInClass : slideOutClass;

    const alertClasses = `fixed ${alertPositionClass} left-0 right-0 ${backgroundColor} ${textColor} text-center ${padding} transition-transform duration-1000 ease-linear z-50 shadow-md rounded-b-lg`;

    return (
        <div className={alertClasses}>
            {message}
        </div>
    );
};

export default AlertComponent;
