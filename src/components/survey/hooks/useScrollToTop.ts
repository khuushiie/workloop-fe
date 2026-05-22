import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = (dependencies: unknown[] = []) => {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, dependencies);
};

export const useScrollToTopOnRouteChange = () => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [location.pathname]);
};


export const scrollToTop = (behavior: ScrollBehavior = 'instant') => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.scrollTo({
            top: 0,
            left: 0,
            behavior
        });
    } else {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior
        });
    }
};

export default useScrollToTop;
