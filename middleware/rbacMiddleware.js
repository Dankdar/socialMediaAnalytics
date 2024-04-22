const Role = require('../config/roles.json');

exports.checkPermission = (permission) => {
    return (req, res, next) => {
        const userRole = req.headers.interface ? req.headers.interface : 'anonymous';

        if (userRole) {
            const role = Role.roles.find(role => role.name === userRole);

            if (role) {
                const permissions = role.permissions;

                if (permissions.includes(permission)) {
                    return next();
                } else {
                    return res.status(403).json({ error: 'Permission Denied' });
                }
            } else {
                return res.status(403).json({ error: 'Role Not Found' });
            }
        } else {
            return res.status(403).json({ error: 'Invalid User Role' });
        }
    };
};
