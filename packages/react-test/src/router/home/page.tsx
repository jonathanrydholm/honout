import { Suspense } from 'react';

const HomePage = () => {
    return (
        <div>
            <Suspense fallback="loading first">
                <B />
            </Suspense>
        </div>
    );
};

export default HomePage;

const A = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return <div style={{ backgroundColor: 'red' }}>A</div>;
};

const B = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return (
        <Suspense fallback="loading second">
            <A />
        </Suspense>
    );
};
