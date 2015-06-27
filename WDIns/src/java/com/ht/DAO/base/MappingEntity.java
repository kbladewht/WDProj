package com.ht.DAO.base;

public class MappingEntity {

	private String attribute;
	private int type;
	private String dbColumnName;

	public MappingEntity(String attribute, String dbColumnName, int type) {
		this.attribute = attribute;
		this.type = type;
		this.dbColumnName = dbColumnName;
	}

	public MappingEntity(String attribute, String dbColumnName) {
		this.attribute = attribute;
		this.dbColumnName = dbColumnName;
	}

	public MappingEntity(String attribute, int type) {
		this.attribute = attribute;
		this.type = type;
	}

	public MappingEntity(String attribute) {
		this.attribute = attribute;
	}

	public String getAttribute() {
		return attribute;
	}

	public void setAttribute(String attribute) {
		this.attribute = attribute;
	}

	public String getDbColumnName() {
		return dbColumnName;
	}

	public void setDbColumnName(String dbColumnName) {
		this.dbColumnName = dbColumnName;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

}
