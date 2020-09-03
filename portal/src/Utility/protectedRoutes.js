export default function protectedRoutes(type, isLogin, props, permissions) {
  let container_id = props.match.params.datasetId;
  isLogin = Boolean(isLogin);
  switch (type) {
    case 'isLogin': {
      if (!isLogin) return isLogin;
      if (container_id && permissions[0]) {
        let p = permissions[0]['datasetList'].filter((i) => {
          return i.id === parseInt(container_id);
        });
        if (!p[0]) return '404';
      }
      return isLogin;
    }
    case 'unLogin': {
      return !isLogin;
    }
    case 'projectAdmin': {
      if (container_id && permissions) {
        let p = permissions.filter((i) => {
          return i.container_id === parseInt(container_id);
        });
        return p[0] && p[0]['permission'] === 'admin' ? true : '403';
      }
      return true;
    }
    case 'projectUploader': {
      if (container_id && permissions) {
        let p = permissions.filter((i) => {
          return i.container_id === parseInt(container_id);
        });
        return (p[0] && p[0]['permission'] === 'admin') ||
          (p[0] && p[0]['permission'] === 'uploader')
          ? true
          : '403';
      }
      return true;
    }
    default: {
      return true;
    }
  }
}
