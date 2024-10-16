import { useData } from '../useData';
import Counter from './Counter';

const AsyncTestComponent = async (props) => {
    const endpoint = `https://jsonplaceholder.typicode.com/todos/${props.id}`;

    const data = await useData(endpoint, async () => {
        await new Promise((r) => setTimeout(r, 500 * props.id));
        return fetch(endpoint).then((res) => res.json());
    });

    return (
        <div
            style={{
                width: '100%',
                height: '100px',
                backgroundColor: 'white',
                color: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            <div>{data.title}</div>
            <Counter initial={data.id} />
        </div>
    );
};

export default AsyncTestComponent;
