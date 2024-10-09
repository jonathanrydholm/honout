const Home = async ({ children }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return <div>Home page {children}</div>;
};

export default Home;
