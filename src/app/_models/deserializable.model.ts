export interface Deserializable {
  deserialize(input: any, param?: any): this;
}
