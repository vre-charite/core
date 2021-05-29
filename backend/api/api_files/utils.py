
def check_filemeta_permissions(query, zone, project_role, username, _logger):
    if project_role == 'contributor':
        if zone in ["VRECore", "All"]:
            _logger.error('uploader cannot fetch vre core files or processed files')
            return False
        if query.get('uploader') and query.get('uploader') != username:
            _logger.error('Non-admin user can only fetch their own file info')
            return False
        query["permissions_uploader"] = username
    elif project_role == 'collaborator':
        if zone in ["Greenroom", "All"]:
            if query.get('uploader') and query.get('uploader') != username:
                _logger.error('Non-admin user can only fetch their own file info')
                return False
            query["permissions_uploader"] = username
    return query 
