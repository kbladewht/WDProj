package com.ht.DAO.base;

import java.util.HashMap;
import java.util.Map;

public class MappingEntityCollection {

	private Map<String, MappingEntity> m = new HashMap<String, MappingEntity>();
	private String tableName;

	public MappingEntityCollection() {

	}

	public MappingEntityCollection(String tableName) {
		this.tableName = tableName;
	}

	/**
	 * 
	 * Setup insert column information
	 * @param attribute
	 * @param dbColumnName
	 * @param type
	 */
	public MappingEntityCollection add(String attribute, String dbColumnName, int type) {
		MappingEntity obj = new MappingEntity(attribute, dbColumnName, type);
		m.put(obj.getAttribute(), obj);
		return this;
	}

	/**
	 * Setup insert column information
	 * @param attribute
	 * @param dbColumnName
	 */
	public MappingEntityCollection add(String attribute, String dbColumnName) {
		MappingEntity obj = new MappingEntity(attribute, dbColumnName);
		m.put(obj.getAttribute(), obj);
		return this;
	}

	/**
	 * Setup insert column information
	 * @param attribute
	 * @param type
	 */
	public MappingEntityCollection add(String attribute, int type) {
		MappingEntity obj = new MappingEntity(attribute, type);
		m.put(obj.getAttribute(), obj);
		return this;
	}
	
	/**
	 * Setup insert column information
	 * @param attribute
	 */
	public MappingEntityCollection add(String attribute) {
		MappingEntity obj = new MappingEntity(attribute);
		m.put(obj.getAttribute(), obj);
		return this;
	}
	
	/**
	 * Setup insert column information
	 * @param attribute
	 */
	public MappingEntityCollection add(String... attrArray) {
		
		for(String attr : attrArray){
			MappingEntity obj = new MappingEntity(attr);
			m.put(obj.getAttribute(), obj);
		}
				
		return this;
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	public Map<String, MappingEntity> getEntityMap() {
		return m;
	}

}
