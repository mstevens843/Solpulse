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
            timestamps: false,
            paranoid: false,
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



// OLD CODE: 
// module.exports = (sequelize, DataTypes) => {
//     const Follower = sequelize.define('Follower', {
//         followerId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         followingId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         }
//     });

//     Follower.associate = function(models) {
//         Follower.belongsTo(models.User, { as: 'follower', foreignKey: 'followerId' });
//         Follower.belongsTo(models.User, { as: 'following', foreignKey: 'followingId' });
//     };

//     return Follower;
// };

// Key Updates and Features:
// references Field:

// Specifies relationships to the Users table to enforce referential integrity.
// onDelete: 'CASCADE':

// Ensures that follower relationships are removed when either the follower or following user is deleted.
// Unique Constraint:

// Added a unique index on the combination of followerId and followingId to prevent duplicate follow relationships.
// Explicit Table Name:

// Set the table name explicitly with tableName: 'Followers' to make it consistent with your naming conventions.
// No Timestamps:

// Disabled timestamps because follow relationships likely don’t need createdAt or updatedAt.
// Associations with Aliases:

// Clear aliases (as: 'follower' and as: 'following') make querying relationships more intuitive.

// Follower Model
// Changes:
// Indexed followerId and followingId:

// Prevents duplicate follow relationships using a unique composite index.
// Self-referencing associations:

// Added follower and following aliases for better readability and usage in queries.
// Cascade on delete:

// When a user is deleted, all their follow relationships (followers and following) are also removed.
// Rationale:
// Avoids duplicates in the follower table and ensures efficient querying.
// Cleans up redundant data when a user is deleted, adhering to database integrity best practices.