module.exports = (sequelize, DataTypes) => {
    const Follower = sequelize.define(
        'Follower',
        {
            followerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            followingId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        },
        {
            timestamps: true, 
            paranoid: false,   // No soft delete
            tableName: 'Followers',
            indexes: [
                {
                    unique: true,
                    fields: ['followerId', 'followingId'],
                },
            ],
        }
    );

    Follower.associate = (models) => {
        Follower.belongsTo(models.User, {
            as: 'follower',
            foreignKey: 'followerId',
            onDelete: 'CASCADE',
        });

        Follower.belongsTo(models.User, {
            as: 'following',
            foreignKey: 'followingId',
            onDelete: 'CASCADE',
        });
    };

    return Follower;
};