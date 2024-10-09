const HomeTemplate = (props) => {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'green',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '60px',
                    boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
                }}
            >
                Navigation Bar
            </div>
            {props?.children}
        </div>
    );
};

export default HomeTemplate;
