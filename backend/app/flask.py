# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

import flask
from werkzeug.utils import cached_property


class Request(flask.Request):
    """Request object used by default in Flask."""

    @cached_property
    def headers(self):
        """Return mutable copy of headers.

        This allows OpenTelemetry update headers when they are passed to subsequent requests.
        """

        return dict(super().headers)


class Flask(flask.Flask):
    """Flask main application object with overridden classes."""

    request_class = Request
