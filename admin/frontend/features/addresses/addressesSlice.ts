import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Address, AddressListResponse } from '@/types';
import { AddressesService } from '@/services/addressesService';
import { RootState } from '@/store/store';

interface AddressesState {
  items: Address[];
  meta: {
    page: number;
    total: number;
    limit: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AddressesState = {
  items: [],
  meta: {
    page: 1,
    total: 0,
    limit: 10,
  },
  loading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await AddressesService.list(params);
    return response;
  }
);

export const getAddress = createAsyncThunk(
  'addresses/getAddress',
  async (addressId: string) => {
    const response = await AddressesService.get(addressId);
    return response;
  }
);

export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (data: { name: string }) => {
    const response = await AddressesService.create(data);
    return response;
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ addressId, data }: { addressId: string; data: { name: string } }) => {
    const response = await AddressesService.update(addressId, data);
    return response;
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (addressId: string) => {
    await AddressesService.delete(addressId);
    return addressId;
  }
);

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    resetAddressesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<AddressListResponse>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch addresses';
      })
      
      // Get single address
      .addCase(getAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      
      // Create address
      .addCase(createAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.items.push(action.payload);
        state.meta.total += 1;
      })
      
      // Update address
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete address
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.meta.total -= 1;
      });
  },
});

export const { resetAddressesState } = addressesSlice.actions;

// Selectors
export const selectAddresses = (state: any) => state.addresses.items;
export const selectAddressesMeta = (state: any) => state.addresses.meta;
export const selectAddressesLoading = (state: any) => state.addresses.loading;
export const selectAddressesError = (state: any) => state.addresses.error;
export const selectAddressById = (state: any, addressId: string) => 
  state.addresses.items.find((address: Address)  => address.id === addressId);

export default addressesSlice.reducer;