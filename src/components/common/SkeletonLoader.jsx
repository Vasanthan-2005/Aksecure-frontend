
import React from 'react';
import PropTypes from 'prop-types';

const SkeletonLoader = ({
    className = "",
    variant = "rectangular", // rectangular, circular, text
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-slate-700/50 rounded";
    const variantClasses = {
        rectangular: "rounded-md",
        circular: "rounded-full",
        text: "rounded h-4 w-3/4"
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant] || ""} ${className}`}
            style={style}
        />
    );
};

SkeletonLoader.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['rectangular', 'circular', 'text']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SkeletonLoader;
