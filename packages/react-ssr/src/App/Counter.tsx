import { useState } from 'react';

interface ICounter {
    initial: number;
}

const Counter = ({ initial }: ICounter) => {
    const [counter, setCounter] = useState(initial);
    return (
        <button onClick={() => setCounter(counter + 1)}>
            Counter: {counter}
        </button>
    );
};

export default Counter;
