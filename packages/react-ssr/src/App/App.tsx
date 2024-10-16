import { Suspense } from 'react';
import AsyncTestComponent from './AsyncTestComponent';

const App = () => {
    const ids: number[] = [1, 2, 3, 4, 5];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div
                style={{
                    width: '100%',
                    height: '60px',
                    boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
                }}
            >
                PRODUKTER
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '32px',
                }}
            >
                {ids.map((id) => (
                    <Suspense
                        fallback={
                            <div
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    backgroundColor: '#efefef',
                                    color: 'black',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                Loading product...
                            </div>
                        }
                        key={`${id}`}
                    >
                        <AsyncTestComponent id={id} />
                    </Suspense>
                ))}
            </div>
        </div>
    );
};

export default App;
