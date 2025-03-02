// store/features/progressSlice.test.ts
import progressReducer, {
  SET_CURRENT_PAGE,
  SET_MODULE_COMPLETED,
  SET_MODULE_ID,
  SET_USER_ID,
  SET_PROGRESS_PERCENTAGE,
  RESET_PROGRESS,
} from './progressSlice';

describe('progress reducer', () => {
  const initialState = {
    currentPage: 1,
    isModuleCompleted: false,
    moduleId: null,
    userId: null,
    progressPercentage: 0,
  };

  it('should handle initial state', () => {
    expect(progressReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle SET_CURRENT_PAGE', () => {
    const actual = progressReducer(initialState, SET_CURRENT_PAGE(3));
    expect(actual.currentPage).toEqual(3);
  });

  it('should handle SET_MODULE_COMPLETED', () => {
    const actual = progressReducer(initialState, SET_MODULE_COMPLETED(true));
    expect(actual.isModuleCompleted).toEqual(true);
  });

  it('should handle SET_MODULE_ID', () => {
    const actual = progressReducer(initialState, SET_MODULE_ID('module-1'));
    expect(actual.moduleId).toEqual('module-1');
  });

  it('should handle SET_USER_ID', () => {
    const actual = progressReducer(initialState, SET_USER_ID('user-123'));
    expect(actual.userId).toEqual('user-123');
  });

  it('should handle SET_PROGRESS_PERCENTAGE', () => {
    const actual = progressReducer(initialState, SET_PROGRESS_PERCENTAGE(50));
    expect(actual.progressPercentage).toEqual(50);
  });

  it('should handle RESET_PROGRESS', () => {
    const modifiedState = {
      ...initialState,
      currentPage: 5,
      isModuleCompleted: true,
      progressPercentage: 75,
    };
    const actual = progressReducer(modifiedState, RESET_PROGRESS());
    expect(actual).toEqual(initialState);
  });
});
