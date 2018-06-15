module.exports = {
    module: 'react-ui-tree',
    children: [
        {
            module: 'dist',
            collapsed: true,
            children: [
                {
                    module: 'node.js',
                    leaf: true
                },
                {
                    module: 'tree-theme.css',
                    leaf: true
                },
                {
                    module: 'react-ui-tree.js',
                    leaf: true
                },
                {
                    module: 'tree.js',
                    leaf: true
                }
            ]
        },


        {
            module: '.gitiignore',
            leaf: true
        },
        {
            module: 'index.js',
            leaf: true
        }

    ]
};