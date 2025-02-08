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
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Posts', 
                    key: 'id',
                },
            },
            content: {
                type: DataTypes.TEXT, 
                allowNull: false,
                validate: {
                    notEmpty: true, 
                },
            },
        },
        {
            timestamps: true, 
            tableName: 'Comments', 
        }
    );

    // Associations
    Comment.associate = function (models) {
        Comment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user', 
            onDelete: 'CASCADE', 
            hooks: true,
        });
        Comment.belongsTo(models.Post, {
            foreignKey: 'postId',
            as: 'post',
            onDelete: 'CASCADE',
            hooks: true,         
        });
    };

    return Comment;
};