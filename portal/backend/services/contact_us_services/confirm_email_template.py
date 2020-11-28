def confirm_email_body_generator(title, category, description, email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear VRE Member,</h4>\
                <p>Your email has been sent to VRE platform administrator:</p>\
                <br>
                <p>Issue title: {}</p>\
                <p>Issue category: {}</p>\
                <p>Issue description:</p>\
                <p>{}</p><br><br><br>\
                <p>This is an automated message. Should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(title, category, description, email)
    )
