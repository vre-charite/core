var roleMap = {
    site_admin: "Platform Administrator",
    admin: "Project Administrator",
    member: "Member",
    contributor: "Project Contributor",
    uploader: "Project Contributor",
    visitor: "Visitor",
    collaborator: "Project Collaborator"
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
