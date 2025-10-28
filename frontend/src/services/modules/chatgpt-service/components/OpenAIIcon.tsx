import React from 'react';

interface OpenAIIconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const OpenAIIcon: React.FC<OpenAIIconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 20.88L12 17.77L5.82 20.88L7 14.14L2 9.27L10.91 8.26L12 2Z"
                fill={color}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default OpenAIIcon;
