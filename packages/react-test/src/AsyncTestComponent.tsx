import Counter from './Counter';

const AsyncTestComponent = async (props) => {
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${props.id}`
    );
    const data = await res.json();
    await new Promise((resolve) => setTimeout(resolve, 500 * props.id));

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
            <Counter />
        </div>
    );
};

export default AsyncTestComponent;
