/**
 * Mock untuk fs/promises yang digunakan dalam test
 */

export const mockReadFile = jest.fn().mockResolvedValue(Buffer.from(''));
export const mockAppendFile = jest.fn().mockResolvedValue(undefined);

const fsMock = {
  readFile: mockReadFile,
  appendFile: mockAppendFile
};

export default fsMock;
