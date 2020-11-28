def invitation_email_body_generator(invitor, project_name, role, register_link, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear VRE member,</h4>\
                <p>{} has invited you to the following project:</p>\
                <p>Project Name: {}</p>\
                <p>Role: {}</p><br>\
                <p>In order to access the project please visit the link below: </p>\
                <a href="{}">Project Link</a><br>\
                <p>If you are having difficulty accessing the link please copy and paste the following into your browser:</p>\
                <p>{}</p><br><br><br>\
                <p>This is an automated message, should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(invitor, project_name, role, register_link, register_link, admin_email)
    )

def invitation_email_body_generator_without_project(invitor, register_link, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear VRE member,</h4>\
                <p>{} has invited you to VRE</p>\
                <p>In order to access the platform please visit the link below: </p>\
                <a href="{}">Project Link</a><br>\
                <p>If you are having difficulty accessing the link please copy and paste the following into your browser:</p>\
                <p>{}</p><br><br><br>\
                <p>This is an automated message, should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(invitor, register_link, register_link, admin_email)
    )
