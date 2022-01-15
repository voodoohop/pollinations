const NotebookTitle = ({name, children}) => (name && (
    <h4>
        { 
            name 
        }
        &nbsp;
        {children && {...children}}
    </h4>) || null
);

export default NotebookTitle;