const PanelTemplate = async ({ children }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return <div>Panel page {children}</div>;
};

export default PanelTemplate;
