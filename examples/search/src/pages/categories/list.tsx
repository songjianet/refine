import {
    List,
    Table,
    useTable,
    IResourceComponentsProps,
    Space,
    EditButton,
    ShowButton,
    BooleanField,
} from "@pankod/refine";

import { ICategory } from "interfaces";

export const CategoryList: React.FC<IResourceComponentsProps> = () => {
    const { tableProps } = useTable<ICategory>();

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="title" title="Title" />
                <Table.Column
                    dataIndex="active"
                    title="Active"
                    render={(value) => {
                        return <BooleanField value={value} />;
                    }}
                />
                <Table.Column<ICategory>
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            <EditButton size="small" recordItemId={record.id} />
                            <ShowButton size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};