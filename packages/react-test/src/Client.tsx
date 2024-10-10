import { hydrateRoot } from 'react-dom/client';
import ClientComponent from './ClientComponent';
import Counter from './Counter';

const counterElements = document.getElementsByClassName('Counter');

for (let i = 0; i < counterElements.length; i++) {
    hydrateRoot(counterElements[i], <Counter />);
}

const clientComponentElements =
    document.getElementsByClassName('ClientComponent');

for (let i = 0; i < clientComponentElements.length; i++) {
    hydrateRoot(clientComponentElements[i], <ClientComponent />);
}
