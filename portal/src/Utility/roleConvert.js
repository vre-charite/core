var roleMap = {
    site_admin: "Platform Administrator",
    admin: "Project Administrator",
    member: "Member",
    contributor: "Contributor",
    uploader: "Contributor",
    visitor: "Visitor"
}

/**
 * Transfer role for rendering
 * @param {*} role 
 */
function formatRole(role) {
    return roleMap[role]
}

/**
 * Convert uploader role to contributor
 * @param {*} role 
 */
function convertRole(role) {
    return role === 'uploader' ? 'contributor' : role
}

export { formatRole, convertRole }
