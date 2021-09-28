import React  from 'react'
import {DatasetCard as Card} from '../../Components/DatasetCard/DatasetCard'
import SchemaTemplates from '../Components/SchemaTemplates/SchemaTemplates'

export default function DatasetSchemaTemplates(props) {
    return <Card title='Schemas'><SchemaTemplates /></Card>
}