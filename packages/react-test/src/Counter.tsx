import { useState } from 'react';

const Counter = ({ initialCounter }: { initialCounter: number }) => {
    const [counter, setCounter] = useState(initialCounter);
    return (
        <button onClick={() => setCounter(counter + 1)}>
            Counter: {counter}
        </button>
    );
};

export default Counter;
