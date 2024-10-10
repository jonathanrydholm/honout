import { Suspense } from 'react';

const App = () => {
    return (
        <div>
            <h1>This is the app component</h1>
            <Suspense fallback="Loading counter...">
                <AsyncTestComponent />
            </Suspense>
        </div>
    );
};

const AsyncTestComponent = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await res.json();
    return (
        <div>
            <h4>{data.title}</h4>
        </div>
    );
};

export default App;
