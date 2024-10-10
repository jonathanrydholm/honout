import { useState } from 'react';

const ClientComponent = () => {
    const [visible, setvisible] = useState(false);

    if (visible) {
        return <div>VISIBLE!</div>;
    }
    return <button onClick={() => setvisible(true)}>Set visibility</button>;
};

export default ClientComponent;
