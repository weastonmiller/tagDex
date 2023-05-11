/** @jsxImportSource theme-ui */
import {
  Button,
  Divider,
  Input,
  Popconfirm,
  Statistic,
  Typography,
  message,
  Tag,
  Table,
} from 'antd';
import { DeleteTag, GetTags, UpdateTag } from '../queries';
import { CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useColorMode } from 'theme-ui';
import { theme } from '../theme';

import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useAuthContext } from '../contexts/AuthContext';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [colorMode] = useColorMode();
  const [editIndex, setEditIndex] = useState(-1);
  const [deleteIndex, setDeleteIndex] = useState(-1);

  const [oldValue, setOldValue] = useState('Tag updated');

  const [getTags, { getTagsLoading }] = useLazyQuery(GetTags, {
    onCompleted: (data) => {
      setTags(data.getTags);
    },
    onError: () => {
      message.error('There was a problem fetching tags');
    },
  });

  const [updateTag, { loading: updateTagLoading }] = useMutation(UpdateTag, {
    onCompleted: (data) => {
      if (data.updateTag) {
        setEditIndex(-1);
        message.success('Tag Updated');
      }
    },
    onError: () => {
      message.error('There was a problem updating the tag');
    },
  });

  const [deleteTag, { loading: deleteTagLoading }] = useMutation(DeleteTag, {
    onCompleted: (data) => {
      if (data) {
        message.success('Tag Deleted');
        const thing = [...tags];
        thing.splice(deleteIndex, 1);
        setTags(thing);
        setDeleteIndex(-1);
      }
    },
    onError: () => {
      message.error('There was a problem deleting the tag');
    },
  });

  const { role } = useAuthContext();

  function submitUpdate(tag) {
    delete tag.__typename;
    if (!tag.label || !tag.label.length || tag.label.length == 0) {
      return;
    }
    updateTag({ variables: { _id: tag._id, input: { label: tag.label } } });
  }

  function changeInput(tag, index) {
    if (index === editIndex) {
      return (
        <Input
          defaultValue={tag.label}
          className={
            colorMode === 'light'
              ? 'light-input-standard'
              : 'dark-input-standard'
          }
          onChange={(e) => {
            const newTags = [...tags];
            newTags.splice(index, 1, {
              ...tag,
              label: e.target.value,
            });
            setTags(newTags);
          }}
          onPressEnter={() => {
            submitUpdate(tag);
          }}
          key={tag._id}
        />
      );
    } else {
      return (
        <Tag
          color={theme.colors.primary}
          style={{
            width: 'fit-content',
            height: 'fit-content',
          }}
          key={tag._id}
        >
          {tag.label}
        </Tag>
      );
    }
  }

  function changeActions(tag, index) {
    return (
      <div sx={{ display: 'flex', alignItems: 'center' }} key={index}>
        <Popconfirm
          title="Delete tag"
          description="Are you sure you want to delete this tag?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            setDeleteIndex(index);
            deleteTag({ variables: { _id: tag._id } });
          }}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            style={{ marginRight: '1rem' }}
            loading={deleteTagLoading}
          />
        </Popconfirm>
        {index === editIndex ? (
          <Button
            type="primary"
            icon={<CloseOutlined />}
            onClick={() => {
              setEditIndex(null);
              const thing = [...tags];
              thing[index].label = oldValue;
              setTags(thing);
            }}
            loading={updateTagLoading}
          />
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setOldValue(tag.label);
              setEditIndex(index);
              if (editIndex > -1 && editIndex != index) {
                const thing = [...tags];
                thing[editIndex].label = oldValue;
                setTags(thing);
                setEditIndex(index);
              } else {
                setEditIndex(index);
                setOldValue(tag.label);
              }
            }}
          />
        )}
      </div>
    );
  }

  useEffect(() => {
    if (search === '') {
      setTags([]);
    }
  }, [search]);

  return (
    <div
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {role < 2 ? null : (
        <div
          sx={{
            height: '100%',
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              sx={{
                height: 'fit-content',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'flex-end',
              }}
            >
              <div
                sx={{
                  height: 'fit-content',
                  width: '100%',
                  display: 'flex',
                }}
              >
                <Input
                  allowClear
                  className={
                    colorMode === 'light'
                      ? 'light-input-standard'
                      : 'dark-input-standard'
                  }
                  style={{
                    width: '100%',
                  }}
                  placeholder="Ex. landspeeder"
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  onPressEnter={() =>
                    getTags({
                      variables: { label: search },
                    })
                  }
                />
              </div>
              <Statistic
                title={
                  <Typography.Text
                    style={{
                      color:
                        colorMode === 'light'
                          ? theme.colors.text
                          : theme.colors.modes.dark.text,
                    }}
                  >
                    Results
                  </Typography.Text>
                }
                value={tags.length}
                style={{
                  marginLeft: '1rem',
                  width: 'fit-content',
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
                valueStyle={{
                  color:
                    colorMode === 'light'
                      ? theme.colors.text
                      : theme.colors.modes.dark.text,
                }}
              />
            </div>
            <Divider
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                backgroundColor:
                  colorMode === 'light'
                    ? theme.colors.divider
                    : theme.colors.modes.dark.divider,
              }}
            />

            <Table
              columns={[
                {
                  title: 'Tag',
                  dataIndex: 'label',
                  key: '_id',
                  render: (_, tag, index) => changeInput(tag, index),
                  defaultSortOrder: 'ascend',
                  sorter: (a, b) => {
                    if (a.label < b.label) {
                      return -1;
                    } else if (a.label > b.label) {
                      return 1;
                    } else {
                      return 0;
                    }
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, tag, index) => changeActions(tag, index),
                },
              ]}
              dataSource={tags}
              rowKey={tags._id}
              pagination={false}
              loading={getTagsLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
