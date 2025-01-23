module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        'Comment',
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // Reference to the Users table
                    key: 'id',
                },
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Posts', // Reference to the Posts table
                    key: 'id',
                },
            },
            content: {
                type: DataTypes.TEXT, // Allows for longer comments
                allowNull: false,
                validate: {
                    notEmpty: true, // Ensures content is not empty
                },
            },
        },
        {
            timestamps: true, // Automatically adds createdAt and updatedAt fields
            tableName: 'Comments', // Explicitly defining table name for clarity
        }
    );

    // Associations
    Comment.associate = function (models) {
        Comment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user', // Alias for easier query usage
            onDelete: 'CASCADE', // Automatically delete comments if the user is deleted
            hooks: true,         // Required for CASCADE to work
        });
        Comment.belongsTo(models.Post, {
            foreignKey: 'postId',
            as: 'post', // Alias for easier query usage
            onDelete: 'CASCADE', // Automatically delete comments if the post is deleted
            hooks: true,         // Required for CASCADE to work
        });
    };

    return Comment;
};

  


// Key Updates and Features:
// references Field:

// Specifies the referenced table (Users and Posts) and key (id).
// Ensures proper foreign key constraints.
// onDelete: 'CASCADE':

// Automatically removes comments if the associated user or post is deleted.
// Field Enhancements:

// Changed content to DataTypes.TEXT for longer comment support.
// Added a validate rule to ensure the content field is not empty.
// Explicit Table Name:

// Defined the table name explicitly with tableName: 'Comments' for clarity.
// Aliases in Associations:

// Added as: 'user' and as: 'post' to make queries more readable (e.g., comment.user or comment.post).