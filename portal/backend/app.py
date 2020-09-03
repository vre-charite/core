from app import create_app
from services.logger_services.logger_factory_service import SrvLoggerFactory

app = create_app()
main_logger = SrvLoggerFactory('main').get_logger()
port = 5060

# add to https
# trigger cicd ####

if __name__ == '__main__':
    main_logger.info('Start Flask App On Port: ' + str(port))
    app.run(host='0.0.0.0', port=port, debug=True)
