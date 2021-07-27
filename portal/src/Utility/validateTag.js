function validateTag(tag) {
  const re = /^[a-z0-9-]{1,32}$/;
  return re.test(tag);
}

export { validateTag };
