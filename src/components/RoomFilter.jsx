/** @jsxImportSource react */

import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const FilterButton = styled(Button)(({ theme, active }) => ({
  borderRadius: '20px',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1), // Add some bottom margin for smaller screens
  textTransform: 'none',
  ...(active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(!active && {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  }),
}));

const RoomFilter = () => {
  const [activeFilter, setActiveFilter] = React.useState('All Rooms');

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
      {['All Rooms', 'Living Room', 'Kitchen', 'Bedroom', 'Bathroom'].map((room) => (
        <FilterButton
          key={room}
          active={activeFilter === room}
          onClick={() => handleFilterClick(room)}
        >
          {room}
        </FilterButton>
      ))}
    </Box>
  );
};

export default RoomFilter;