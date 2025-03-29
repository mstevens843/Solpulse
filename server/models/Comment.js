module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        'Comment',
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Posts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Comment cannot be empty.',
                    },
                    len: {
                        args: [1, 500],
                        msg: 'Comment must be between 1 and 500 characters.',
                    },
                },
            },
        },
        {
            timestamps: true,
            tableName: 'Comments',
            indexes: [
                { fields: ['userId'] },        // ✅ Improves filtering by user
                { fields: ['postId'] },        // ✅ Improves filtering by post
                { fields: ['createdAt'] },     // ✅ Optimizes time-based queries
            ],
        }
    );

    // **Associations**
    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'commentAuthor', // ✅ Clearer alias for author
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        Comment.belongsTo(models.Post, {
            foreignKey: 'postId',
            as: 'post',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    // **Hooks for Data Integrity**
    Comment.beforeCreate(async (comment) => {
        // ✅ Prevent whitespace-only comments
        if (!comment.content.trim()) {
            throw new Error('Comment cannot be empty or contain only whitespace.');
        }
    });

    // **Instance Methods**
    Comment.prototype.getCommentDetails = function () {
        return {
            id: this.id,
            userId: this.userId,
            postId: this.postId,
            content: this.content,
            createdAt: this.createdAt,
        };
    };

    return Comment;
};

/**
 * 🔹 Summary of Optimizations
✅ 🚀 Performance Enhancements

Added indexes (userId, postId, createdAt) → Optimized filtering and sorting.
Explicit foreign key constraints (onDelete: CASCADE, onUpdate: CASCADE) → Ensures data consistency.

✅ 🔒 Data Integrity Fixes

Prevented empty/whitespace-only comments with a beforeCreate hook.
Limited content to 500 characters to prevent excessive comment sizes.

✅ 📄 Maintainability & Readability

Renamed associations (commentAuthor) to clarify relationships.
Added getCommentDetails method to return structured comment data.
 */
