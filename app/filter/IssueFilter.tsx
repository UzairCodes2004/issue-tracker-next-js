import React, { useState } from 'react';
import { Select } from '@radix-ui/themes';

type Status = 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | '';

const statuses = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'IN PROGRESS', value: 'IN_PROGRESS' }
];

const IssueFilter = () => {
  const [value, setValue] = useState<Status>('');

  return (
    <Select.Root value={value} onValueChange={(val) => setValue(val as Status)}>
      <Select.Trigger placeholder="Filter by status" />
      <Select.Content>
        {statuses.map((status) => (
          <Select.Item key={status.value} value={status.value}>
            {status.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default IssueFilter;