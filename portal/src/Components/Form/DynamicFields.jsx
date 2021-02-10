import React, { useState } from "react";
import { Form, Button, Select, Checkbox } from "antd";

// import styles from "./index.module.scss";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
const { Option } = Select;

//Sample data for options hook
const tags = {
    Accessment: ["XNAT", "Cardiacmr", "Genonics", "REMS"],
    Sites: ["Berlin", "Amsterdam", "London"],
};

/**
 * Query component: Creates any numbers of query fields
 *
 * @param {*} { data = [] } Initial query fields
 * @returns a series of form item
 */
function DynamicFields({ data = [] }) {
    const [searchTerms, setSearchTerms] = useState(data);
    const [addField, setAddField] = useState(false); //Is adding new field?
    const [options, setOptions] = useState(tags); // All the options of the search term

    const addInput = (label) => {
        if (searchTerms.some((term) => term.label === label)) return;

        const index = !searchTerms.length
            ? 0
            : searchTerms[searchTerms.length - 1].index + 1;
        const newsearchTerms = [
            ...searchTerms,
            {
                index: index,
                name: label.toLowerCase(),
                label: label,
                options: options[label],
            },
        ];
        setSearchTerms(newsearchTerms);
    };

    const deleteInput = (e, index) => {
        e.preventDefault();
        const newSearchTerms = searchTerms.filter(
            (item) => index !== item.index
        );
        setSearchTerms(newSearchTerms);
    };

    function handleNewField(value, add) {
        setAddField(false);
        // TODO: should also add options information
        add(value);
    }

    function handleSearch(value) {
        // Todo: get options from API call
        // append into the options hook
        // setOptions(tags+newTags);
        console.log(value);
    }

    function printOptions() {
        return Object.keys(options).map((item) => (
            <Option key={item}>{options.item}</Option>
        ));
    }

    function onChange(value) { }

    return (
        <>
            {searchTerms.map((item, index) => (
                <Form.Item
                    label={
                        <>
                            {item.label}{" "}
                            <MinusCircleOutlined
                                style={{
                                    margin: "0 8px",
                                }}
                                onClick={(e) => {
                                    deleteInput(e, item.index);
                                }}
                            />
                        </>
                    }
                    name={item.name}
                    key={`check-${item.index}`}
                >
                    <Checkbox.Group
                        options={item.options}
                        onChange={onChange}
                    />
                </Form.Item>
            ))}
            {searchTerms.length < 4 && (
                <Form.Item>
                    {addField ? (
                        <Select
                            showSearch
                            placeholder="Search the field you want to query against"
                            defaultActiveFirstOption={false}
                            filterOption={false}
                            onSearch={handleSearch}
                            onChange={(value) =>
                                handleNewField(value, addInput)
                            }
                            notFoundContent={null}
                        >
                            {options && printOptions()}
                        </Select>
                    ) : (
                            <Button
                                type="dashed"
                                onClick={() => {
                                    setAddField(true);
                                }}
                                style={{
                                    width: "100%",
                                }}
                            >
                                <PlusOutlined />
                                Add a Metadata term
                        </Button>
                        )}
                </Form.Item>
            )}
        </>
    );
}

export default DynamicFields;
