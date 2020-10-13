from .module_api import module_api
from .api_hello_world import APIHelloWorld
from .api_invitation import APIInvitation
from .api_report import APIReport
from .api_auth import APIAuthService
from .api_contact_us import APIContactUs
from dataset.route_registry import APIDateSet

apis = [
    APIHelloWorld(),
    APIInvitation(),
    APIDateSet(),
    APIReport(),
    APIAuthService(),
    APIContactUs()
]


def api_registry(apis):
    if len(apis) > 0:
        for api_sub_module in apis:
            api_sub_module.api_registry()
    else:
        print('[Fatal]', 'No API registered.')


api_registry(apis)
