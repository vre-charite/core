// fake data generator
export const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: (
      <Card
        style={{ width: 300 }}
        actions={[
          <UploadOutlined key="upload" />,
          <SelectOutlined key="access" />,
          <ShareAltOutlined key="share" />,
        ]}
      >
        <Meta
          avatar={
            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
          }
          title="Card title"
          description="This is the description"
        />
      </Card>
    ),
  }));
