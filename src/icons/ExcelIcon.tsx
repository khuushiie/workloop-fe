import React from 'react';

const ExcelIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="30" 
      height="30" 
      viewBox="0 0 256 256"
      className={className}
      {...props}
    >
      <g 
        fill="#107c41" 
        fillRule="nonzero" 
        stroke="none" 
        strokeWidth="1" 
        strokeLinecap="butt" 
        strokeLinejoin="miter" 
        strokeMiterlimit="10" 
        strokeDasharray="" 
        strokeDashoffset="0" 
        fontFamily="none" 
        fontWeight="none" 
        fontSize="none" 
        textAnchor="none" 
        style={{ mixBlendMode: 'normal' }}
      >
        <g transform="scale(8.53333,8.53333)">
          <path d="M15,3c-0.13457,0.00082 -0.26871,0.01521 -0.40039,0.04297l-0.00195,-0.00195l-9.96875,1.99414l-0.00195,0.00195c-0.94311,0.17905 -1.62599,1.00293 -1.62695,1.96289v16c0.00021,0.9613 0.68429,1.78648 1.62891,1.96484l9.96875,1.99414c0.13238,0.02723 0.26719,0.04097 0.40234,0.04102c1.10457,0 2,-0.89543 2,-2v-20c0,-1.10457 -0.89543,-2 -2,-2zM19,5v3h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v3h6c1.105,0 2,-0.895 2,-2v-16c0,-1.105 -0.895,-2 -2,-2zM23,8h1c0.552,0 1,0.448 1,1c0,0.552 -0.448,1 -1,1h-1zM6.18555,10h2.40234l1.24414,2.99023c0.101,0.244 0.18177,0.52666 0.25977,0.84766h0.0332c0.045,-0.193 0.13353,-0.48609 0.26953,-0.87109l1.39063,-2.9668h2.1875l-2.61328,4.95508l2.69141,5.04297h-2.33398l-1.50391,-3.25781c-0.057,-0.115 -0.12369,-0.34697 -0.17969,-0.66797h-0.02148c-0.034,0.154 -0.10113,0.38631 -0.20313,0.69531l-1.51367,3.23242h-2.3457l2.7832,-5.00586zM23,12h1c0.552,0 1,0.448 1,1c0,0.552 -0.448,1 -1,1h-1zM23,16h1c0.552,0 1,0.448 1,1c0,0.552 -0.448,1 -1,1h-1zM23,20h1c0.552,0 1,0.448 1,1c0,0.552 -0.448,1 -1,1h-1z"></path>
        </g>
      </g>
    </svg>
  );
};

export default ExcelIcon;